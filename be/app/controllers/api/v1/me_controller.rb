module Api
  module V1
    class MeController < ApplicationController
      def show
        render json: Current.user.slice(:id, :email_address)
      end
    end
  end
end
