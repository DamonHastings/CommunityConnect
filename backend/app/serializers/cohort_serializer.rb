class CohortSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :starts_on, :ends_on, :notes, :program_id, :created_at

  attribute :member_count do |cohort|
    cohort.cohort_memberships.size
  end

  attribute :members do |cohort|
    cohort.members.map { |u| { id: u.id, first_name: u.first_name, last_name: u.last_name, email: u.email } }
  end
end
