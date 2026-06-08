import { useState } from "react";
import axios from "axios";

const Library = () => {
  const [formData, setFormData] = useState({
    bookid: "",
    bookname: "",
    authorname: "",
    booklanguage: "",
    totalbook: "",
    bookprice: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Yahan hum bookid ko hatate hain taaki Database AUTO_INCREMENT use kare
    const dataToSend = { ...formData };
    delete dataToSend.bookid;

    try {
      await axios.post("http://localhost:8080/api/library/save", dataToSend);
      alert("Book Details Saved Successfully!");
      setFormData({ bookid: "", bookname: "", authorname: "", booklanguage: "", totalbook: "", bookprice: "" });
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Error: Save nahi hua. Console check karein (F12).");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
        <h2>Library Management</h2>
        {/* Book ID field ko optionally chhod sakte hain */}
        <input type="number" placeholder="Book ID (Optional)" value={formData.bookid} onChange={(e) => setFormData({...formData, bookid: e.target.value})} style={{width: "100%", margin: "10px 0", padding: "10px"}} />
        <input type="text" placeholder="Book Name" value={formData.bookname} onChange={(e) => setFormData({...formData, bookname: e.target.value})} required style={{width: "100%", margin: "10px 0", padding: "10px"}} />
        <input type="text" placeholder="Author Name" value={formData.authorname} onChange={(e) => setFormData({...formData, authorname: e.target.value})} required style={{width: "100%", margin: "10px 0", padding: "10px"}} />
        <input type="text" placeholder="Language" value={formData.booklanguage} onChange={(e) => setFormData({...formData, booklanguage: e.target.value})} required style={{width: "100%", margin: "10px 0", padding: "10px"}} />
        <input type="number" placeholder="Total Books" value={formData.totalbook} onChange={(e) => setFormData({...formData, totalbook: e.target.value})} required style={{width: "100%", margin: "10px 0", padding: "10px"}} />
        <input type="number" placeholder="Price" value={formData.bookprice} onChange={(e) => setFormData({...formData, bookprice: e.target.value})} required style={{width: "100%", margin: "10px 0", padding: "10px"}} />
        <button type="submit" style={{width: "100%", padding: "10px", backgroundColor: "black", color: "white"}}>Save Book</button>
      </form>
    </div>
  );
};

export default Library;