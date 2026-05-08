class Api::V1::UserTasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_task, only: [:update, :destroy]

  def index
    tasks = current_user.user_tasks.by_due_date
    render json: { tasks: tasks.map { |t| serialize(t) } }
  end

  def create
    task = current_user.user_tasks.build(task_params)
    authorize task
    if task.save
      render json: { task: serialize(task) }, status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @task
    if @task.update(task_params)
      render json: { task: serialize(@task) }
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @task
    @task.destroy!
    head :no_content
  end

  private

  def set_task = @task = current_user.user_tasks.find(params[:id])
  def task_params = params.require(:task).permit(:title, :notes, :due_date, :completed, :source_type, :source_id)
  def serialize(t) = UserTaskSerializer.new(t).serializable_hash[:data][:attributes]
end
