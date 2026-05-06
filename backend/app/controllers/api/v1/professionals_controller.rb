class Api::V1::ProfessionalsController < ApplicationController
  SEARCHABLE_TYPES = %w[individual_professional volunteer resource_navigator].freeze

  def index
    allowed_types = if params[:profile_type].present? && SEARCHABLE_TYPES.include?(params[:profile_type])
      [params[:profile_type]]
    else
      SEARCHABLE_TYPES
    end
    professionals = User.where(profile_type: allowed_types)
    professionals = professionals.where(specialty: params[:specialty]) if params[:specialty].present?
    if params[:q].present?
      q = "%#{params[:q].downcase}%"
      professionals = professionals.where(
        "LOWER(first_name) LIKE :q OR LOWER(last_name) LIKE :q OR LOWER(bio) LIKE :q OR LOWER(specialty) LIKE :q",
        q: q
      )
    end
    render json: { professionals: professionals.order(:last_name, :first_name).map { |u| serialize(u) } }
  end

  private

  def serialize(user)
    UserSerializer.new(user).serializable_hash[:data][:attributes]
  end
end
