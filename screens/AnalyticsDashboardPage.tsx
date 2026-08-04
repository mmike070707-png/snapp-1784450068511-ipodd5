import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface AnalyticsDashboardPageProps {
  navigation: any;
}

const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({ navigation }) => {
  return (
    <PlaceholderPage
      pageTitle="Analytics Dashboard"
      pageName="analytics"
      description="User engagement and gameplay statistics tracking"
      suggestedPrompt="Add analytics dashboard showing user engagement metrics, coin economy stats, popular activities, retention rates, and purchase conversion data"
      navigation={navigation}
    />
  );
};

export default AnalyticsDashboardPage;
