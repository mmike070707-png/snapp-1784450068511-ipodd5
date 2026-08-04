import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface AdminPanelPageProps {
  navigation: any;
}

const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ navigation }) => {
  return (
    <PlaceholderPage
      pageTitle="Admin Panel"
      pageName="admin"
      description="Backend management for content, users, and monetization"
      suggestedPrompt="Add admin panel with user management, content moderation, coin economy balancing tools, purchase history, and ability to adjust pricing and rewards"
    />
  );
};

export default AdminPanelPage;
