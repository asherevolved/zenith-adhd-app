import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://deno.land/x/webpush/mod.ts'

interface Task {
  id: string
  title: string
  reminder: number
  user_id: string
}

interface PushSubscription {
  id: string
  user_id: string
  subscription_payload: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
    )

    // 1. Fetch tasks that need reminders
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, reminder, user_id, last_reminder_sent_at')
      .eq('is_completed', false)
      .not('reminder', 'is', null)

    if (tasksError) throw tasksError

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: 'No tasks with reminders.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Filter tasks based on their reminder interval
    const now = new Date()
    const tasksToRemind = tasks.filter(task => {
      if (!task.reminder) return false
      // If it has never been reminded, send reminder
      if (!task.last_reminder_sent_at) return true
      
      const lastReminderDate = new Date(task.last_reminder_sent_at)
      const minutesSinceLastReminder = (now.getTime() - lastReminderDate.getTime()) / (1000 * 60)
      
      return minutesSinceLastReminder >= task.reminder
    })

    if (tasksToRemind.length === 0) {
      return new Response(JSON.stringify({ message: 'No tasks to remind at this time.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userIds = [...new Set(tasksToRemind.map(t => t.user_id))]

    // 3. Fetch subscriptions for these users
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)

    if (subsError) throw subsError
    
    const vapidKeys = {
      publicKey: Deno.env.get('VAPID_PUBLIC_KEY')!,
      privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!,
    }

    const notificationsToSend = []
    const remindedTaskIds = []

    // 4. Prepare and send notifications
    for (const task of tasksToRemind) {
      const userSubscriptions = subscriptions.filter(s => s.user_id === task.user_id)
      for (const sub of userSubscriptions) {
        const payload = JSON.stringify({
          title: 'Zenith Task Reminder',
          body: `Time to work on: "${task.title}"`,
          url: '/tasks'
        })

        notificationsToSend.push(
          webpush.send(sub.subscription_payload, payload, vapidKeys)
            .catch(err => console.error(`Failed to send notification for task ${task.id}:`, err.message))
        )
      }
      remindedTaskIds.push(task.id)
    }

    await Promise.all(notificationsToSend)

    // 5. Update last_reminder_sent_at for the tasks that were reminded
    if (remindedTaskIds.length > 0) {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ last_reminder_sent_at: now.toISOString() })
        .in('id', remindedTaskIds)

      if (updateError) throw updateError
    }

    return new Response(JSON.stringify({ message: `Sent ${notificationsToSend.length} reminders.` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error sending reminders:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
