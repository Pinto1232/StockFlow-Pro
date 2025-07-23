import React from "react";
import NotificationSoundSettings from "../../components/Settings/NotificationSoundSettings";

const Settings: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Configure application settings and preferences.
                </p>
            </div>

            {/* Notification Sound Settings */}
            <NotificationSoundSettings className="shadow-sm" />

            {/* Placeholder for future settings sections */}
            <div className="card">
                <p className="text-gray-600">Additional settings sections coming soon...</p>
            </div>
        </div>
    );
};

export default Settings;
