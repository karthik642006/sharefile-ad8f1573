
import React, { useRef, useState } from "react";
import { User, Edit, File, Folder, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockUser = {
  username: "johndoe",
  bio: "I share photos, docs, and more!",
  uploads: [
    { name: "Resume.pdf", type: "file", size: "222KB" },
    { name: "Photos", type: "folder", size: "14 files" },
    { name: "Whitepaper.docx", type: "file", size: "950KB" },
  ],
};

const Profile = () => {
  const [bio, setBio] = useState(mockUser.bio);
  const [editingBio, setEditingBio] = useState(false);
  const [profileImg, setProfileImg] = useState<string | undefined>();
  const imgInput = useRef<HTMLInputElement>(null);

  function handleBioEdit() {
    setEditingBio(true);
  }

  function handleBioSave() {
    setEditingBio(false);
    // Save bio in DB (not implemented)
  }

  function handleProfileImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImg(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
      // Upload to Supabase storage in real implementation
    }
  }

  return (
    <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#e5deff] to-[#f1f1f1] py-10 animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4">
          {/* Profile picture with upload support */}
          <div
            className="relative group cursor-pointer"
            onClick={() => imgInput.current?.click()}
            tabIndex={0}
          >
            <div className="rounded-full overflow-hidden w-24 h-24 border-4 border-[#dfd8fc] bg-gray-50 flex items-center justify-center transition hover:shadow-lg hover-scale">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <User size={48} className="text-white bg-[#9b87f5] p-2 rounded-full" />
              )}
              <input
                ref={imgInput}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleProfileImgChange}
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-[#9b87f5] text-white p-1 rounded-full shadow-lg opacity-80 group-hover:opacity-100">
              <Upload size={16} />
            </div>
          </div>
          {/* Username */}
          <h2 className="text-2xl font-bold text-[#9b87f5]">{mockUser.username}</h2>
          {/* Editable Bio */}
          <div className="w-full flex items-center justify-center gap-2">
            {editingBio ? (
              <>
                <input
                  className="flex-1 px-3 py-2 rounded border focus:outline-none border-[#9b87f5]"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  autoFocus
                  onBlur={handleBioSave}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleBioSave();
                  }}
                />
                <Button size="sm" onClick={handleBioSave} className="bg-[#9b87f5] text-white">
                  Save
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-600">{bio}</p>
                <Button variant="ghost" size="icon" onClick={handleBioEdit}>
                  <Edit className="text-[#9b87f5]" size={18} />
                </Button>
              </>
            )}
          </div>
          <hr className="my-4 w-3/4 border-gray-200" />
          <h3 className="text-lg font-semibold mb-2">Uploads</h3>
          <div className="w-full space-y-3">
            {mockUser.uploads.map((upload, idx) => (
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
