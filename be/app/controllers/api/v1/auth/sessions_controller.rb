class Api::V1::Auth::SessionsController < ApplicationController
  allow_unauthenticated_access only: :create
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { render json: { error: "Rate limit exceeded. Try again later." }, status: :too_many_requests }

  def create
    if (user = User.authenticate_by(params.permit(:email_address, :password)))
      start_new_session_for user
      render json: { email_address: user.email_address }, status: :created
    else
      render json: { error: "Invalid email address or password" }, status: :unauthorized
    end
  end

  def destroy
    terminate_session
    head :no_content
  end
end
