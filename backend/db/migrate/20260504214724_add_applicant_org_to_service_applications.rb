class AddApplicantOrgToServiceApplications < ActiveRecord::Migration[8.1]
  def change
    add_column :service_applications, :applicant_org_id, :bigint
    add_foreign_key :service_applications, :organizations, column: :applicant_org_id
    add_index :service_applications, :applicant_org_id
  end
end
