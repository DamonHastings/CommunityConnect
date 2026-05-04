class ConversationSerializer
  include JSONAPI::Serializer

  attributes :created_at

  attribute :participants do |c|
    c.participants.map { |u| { id: u.id, name: u.full_name } }
  end

  attribute :last_message do |c|
    msg = c.last_message
    next nil unless msg
    { id: msg.id, body: msg.body, sender_name: msg.sender.full_name, created_at: msg.created_at }
  end

  attribute :unread_count do |c, params|
    next 0 unless params[:current_user]
    c.unread_count_for(params[:current_user])
  end
end
