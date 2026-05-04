class ProgramOrganization < ApplicationRecord
  belongs_to :program
  belongs_to :organization

  enum :role, { owner: 0, partner: 1 }
end
