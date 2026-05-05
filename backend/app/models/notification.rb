class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :notifiable, polymorphic: true, optional: true

  enum :notification_type, {
    new_message: 0,
    application_update: 1,
    referral_received: 2,
    partner_request: 3,
    referral_accepted: 4
  }

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  # For new_message: consolidates multiple messages in the same conversation
  # into a single unread notification rather than spamming one per message.
  def self.notify_message!(user:, conversation:, sender_name:, body:)
    existing = find_by(
      user: user,
      notification_type: :new_message,
      notifiable: conversation,
      read_at: nil
    )

    if existing
      existing.update!(
        title: "New message from #{sender_name}",
        body: body.truncate(100),
        actor_name: sender_name,
        created_at: Time.current
      )
    else
      create!(
        user: user,
        notification_type: :new_message,
        title: "New message from #{sender_name}",
        body: body.truncate(100),
        url: "/messages/#{conversation.id}",
        actor_name: sender_name,
        notifiable: conversation
      )
    end
  end

  def mark_read!
    update!(read_at: Time.current) if read_at.nil?
  end
end
