class AddGrantFieldsToServiceApplications < ActiveRecord::Migration[8.1]
  def change
    add_column :service_applications, :award_amount, :decimal, precision: 12, scale: 2
    add_column :service_applications, :disbursed, :boolean, default: false, null: false
  end
end
