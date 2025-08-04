import React from "react";
import ChangePassword from "../../components/Profile/ChangePassword";

const Profile: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your personal information and preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Profile Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                    <p className="text-gray-600">Profile information editing coming soon...</p>
                </div>

                {/* Right column - Change Password */}
                <ChangePassword />
            </div>
        </div>
    );
};

export default Profile;
