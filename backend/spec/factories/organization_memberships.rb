FactoryBot.define do
  factory :organization_membership do
    user { nil }
    organization { nil }
    role { 1 }
    invited_by_id { 1 }
    joined_at { "2026-05-01 06:32:50" }
  end
end
