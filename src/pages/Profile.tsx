
import { User, File, Folder } from "lucide-react";

const Profile = () => {
  // Static mock data for now
  const user = {
    username: "johndoe",
    bio: "I share photos, docs, and more!",
    uploads: [
      { name: "Resume.pdf", type: "file", size: "222KB" },
      { name: "Photos", type: "folder", size: "14 files" },
      { name: "Whitepaper.docx", type: "file", size: "950KB" },
    ],
  };

  return (
    <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#e5deff] to-[#f1f1f1] py-10 animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4">
          <User size={52} className="bg-[#9b87f5] p-2 rounded-full text-white" />
          <h2 className="text-2xl font-bold text-[#9b87f5]">{user.username}</h2>
          <p className="text-gray-600">{user.bio}</p>
          <hr className="my-4 w-3/4 border-gray-200" />
          <h3 className="text-lg font-semibold mb-2">Uploads</h3>
          <div className="w-full space-y-3">
            {user.uploads.map((upload, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-[#f8f6ff] rounded-md px-4 py-2 border"
              >
                {upload.type === "file" ? (
                  <File className="text-[#7E69AB]" size={20} />
                ) : (
                  <Folder className="text-[#33C3F0]" size={20} />
                )}
                <span className="font-semibold">{upload.name}</span>
                <span className="ml-auto text-sm text-gray-400">{upload.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
