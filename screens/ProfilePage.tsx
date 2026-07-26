import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface ProfilePageProps {
  navigation: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ navigation }) => {
  return (
    <PlaceholderPage
      pageTitle="Profile"
      pageName="profile"
      description="User authentication and profile management with progress tracking"
      suggestedPrompt="Add user authentication with email/password login, registration flow, and profile page showing user stats, achievements, and current brewery/trailer progress"
    />
  );
};

export default ProfilePage;
