class Conversation < ApplicationRecord
  has_many :conversation_participants, dependent: :destroy
  has_many :participants, through: :conversation_participants, source: :user
  has_many :messages, -> { order(:created_at) }, dependent: :destroy

  def self.between(user1, user2)
    joins(:conversation_participants)
      .where(conversation_participants: { user_id: user1.id })
      .where(id: joins(:conversation_participants).where(conversation_participants: { user_id: user2.id }))
      .first
  end

  def last_message
    messages.last
  end

  def unread_count_for(user)
    cp = conversation_participants.find_by(user_id: user.id)
    return 0 unless cp
    if cp.last_read_at
      messages.where("created_at > ?", cp.last_read_at).count
    else
      messages.count
    end
  end

  def mark_read_for!(user)
    conversation_participants.find_by(user_id: user.id)&.update!(last_read_at: Time.current)
  end
end
