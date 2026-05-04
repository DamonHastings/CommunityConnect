class AddFundingFieldsToEngagementOpportunities < ActiveRecord::Migration[8.1]
  def change
    add_column :engagement_opportunities, :funding_amount, :decimal, precision: 12, scale: 2
    add_column :engagement_opportunities, :eligibility, :text
  end
end
