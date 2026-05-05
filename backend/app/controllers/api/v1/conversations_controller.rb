class Api::V1::ConversationsController < ApplicationController
  before_action :authenticate_user!

  def index
    conversations = current_user.conversations
      .includes(:conversation_participants, :participants, messages: :sender)
      .order(updated_at: :desc)
    render json: { conversations: serialize_all(conversations) }
  end

  def show
    conversation = current_user.conversations
      .includes(:conversation_participants, :participants, messages: :sender)
      .find(params[:id])
    authorize conversation
    conversation.mark_read_for!(current_user)
    current_user.notifications.unread
      .where(notification_type: :new_message, notifiable: conversation)
      .update_all(read_at: Time.current)
    render json: {
      conversation: serialize_one(conversation),
      messages: conversation.messages.map { |m| serialize_message(m) }
    }
  end

  def create
    recipient = User.find(params[:recipient_id])
    conversation = Conversation.between(current_user, recipient)

    if conversation.nil?
      conversation = Conversation.create!
      conversation.conversation_participants.create!(user: current_user)
      conversation.conversation_participants.create!(user: recipient)
    end

    authorize conversation
    render json: { conversation: serialize_one(conversation) }, status: :created
  end

  private

  def serialize_one(c)
    ConversationSerializer.new(c, params: { current_user: current_user })
      .serializable_hash[:data][:attributes].merge(id: c.id)
  end

  def serialize_all(convs)
    convs.map { |c| serialize_one(c) }
  end

  def serialize_message(m)
    MessageSerializer.new(m).serializable_hash[:data][:attributes].merge(id: m.id)
  end
end
