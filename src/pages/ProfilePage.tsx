import UserProfile from '../components/profile/UserProfile';

const ProfilePage = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <UserProfile />
      </div>
    </div>
  );
};

export default ProfilePage;