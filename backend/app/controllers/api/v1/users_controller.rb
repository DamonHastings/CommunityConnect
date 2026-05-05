class Api::V1::UsersController < ApplicationController
  def show
    user = User.find(params[:id])
    render json: {
      user: UserSerializer.new(user).serializable_hash[:data][:attributes]
    }
  end

  def search
    q = params[:q].to_s.strip
    return render json: { users: [] } if q.length < 2

    users = User.where(
      "lower(first_name || ' ' || last_name) LIKE :q OR lower(email) LIKE :q",
      q: "%#{q.downcase}%"
    ).limit(8)

    render json: {
      users: users.map { |u| { id: u.id, name: "#{u.first_name} #{u.last_name}".strip, email: u.email } }
    }
  end
end
