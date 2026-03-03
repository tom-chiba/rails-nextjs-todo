class Api::V1::Auth::RegistrationsController < ApplicationController
  allow_unauthenticated_access only: :create
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { render json: { error: "Rate limit exceeded. Try again later." }, status: :too_many_requests }

  def create
    user = User.new(user_params)

    if user.save
      start_new_session_for user
      render json: { email_address: user.email_address }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    terminate_session
    Current.user.destroy!
    head :no_content
  end

  private

  def user_params
    params.permit(:email_address, :password, :password_confirmation)
  end
end
