module RequestHelpers
  def auth_headers_for(user, password: "password123")
    post "/api/v1/auth/login",
      params: { user: { email: user.email, password: password } }.to_json,
      headers: { "Content-Type" => "application/json" }
    { "Authorization" => response.headers["Authorization"] }
  end

  def json
    JSON.parse(response.body, symbolize_names: true)
  end
end
