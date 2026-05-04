class Api::V1::MessagesController < ApplicationController
  before_action :authenticate_user!

  def create
    conversation = current_user.conversations.find(params[:conversation_id])
    msg = conversation.messages.build(sender: current_user, body: params[:body])
    if msg.save
      conversation.touch
      render json: { message: serialize(msg) }, status: :created
    else
      render json: { errors: msg.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def serialize(m)
    MessageSerializer.new(m).serializable_hash[:data][:attributes].merge(id: m.id)
  end
end
