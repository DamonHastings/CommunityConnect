class Api::V1::MessagesController < ApplicationController
  before_action :authenticate_user!

  def create
    conversation = current_user.conversations.find(params[:conversation_id])
    msg = conversation.messages.build(sender: current_user, body: params[:body])
    if msg.save
      conversation.touch
      notify_message_recipients(conversation, msg)
      render json: { message: serialize(msg) }, status: :created
    else
      render json: { errors: msg.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def serialize(m)
    MessageSerializer.new(m).serializable_hash[:data][:attributes].merge(id: m.id)
  end

  def notify_message_recipients(conversation, message)
    conversation.participants.where.not(id: current_user.id).each do |recipient|
      Notification.notify_message!(
        user: recipient,
        conversation: conversation,
        sender_name: current_user.full_name,
        body: message.body
      )
    end
  end
end
