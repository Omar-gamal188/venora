// import { useState } from "react";

// const Contact = () => {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert("Message sent successfully!");
//     setForm({ name: "", email: "", message: "" });
//   };
//   return (
//     <div about="contact">
//       {" "}
//       <div className="px-4 py-10 md:px-10 lg:px-20">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
//           {/* Info */}
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#31859c]">
//               Contact Us
//             </h1>

//             <p className="text-gray-600 mb-6">We’d love to hear from you 💙</p>

//             <div className="space-y-3 text-gray-700">
//               <p>
//                 <strong>Email:</strong> support@Venora-store.com
//               </p>
//               <p>
//                 <strong>Phone:</strong> +20 109 547 5596
//               </p>
//               <p>
//                 <strong>Address:</strong> Cairo, Egypt
//               </p>
//             </div>
//           </div>

//           {/* Form */}
//           <form
//             onSubmit={handleSubmit}
//             className="bg-[#31859c]/10 p-6 rounded-2xl shadow-sm space-y-4"
//           >
//             <input
//               type="text"
//               placeholder="Your Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               required
//               className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[#31859c]"
//             />

//             <input
//               type="email"
//               placeholder="Your Email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               required
//               className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[#31859c]"
//             />

//             <textarea
//               placeholder="Your Message"
//               value={form.message}
//               onChange={(e) => setForm({ ...form, message: e.target.value })}
//               required
//               rows="4"
//               className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[#31859c]"
//             />

//             <button
//               type="submit"
//               className="w-full bg-[#31859c] text-white py-3 rounded-lg hover:bg-[#2b7488] transition"
//             >
//               Send Message
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Contact;

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <div className="text-center mt-14 mb-14">
          <h1 className="text-5xl font-bold text-gray-800">
            Contact <span className="text-[#31859c]">Us</span>
          </h1>

          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            We'd love to hear from you. Send us your questions, feedback or
            business inquiries.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left */}

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-5">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Get In Touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#31859c]/10 flex items-center justify-center">
                  <Mail className="text-[#31859c]" />
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Email</p>

                  <h3 className="font-semibold text-gray-800">
                    support@Venora-store.com
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#31859c]/10 flex items-center justify-center">
                  <Phone className="text-[#31859c]" />
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Phone</p>

                  <h3 className="font-semibold text-gray-800">
                    +20 109 547 5596
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#31859c]/10 flex items-center justify-center">
                  <MapPin className="text-[#31859c]" />
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Address</p>

                  <h3 className="font-semibold text-gray-800">Cairo, Egypt</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-5"
          >
            <div className="bg-[#31859c] p-6">
              <h2 className="text-2xl font-bold text-white">Send a Message</h2>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block mb-2 font-medium text-gray-600">
                  Your Name
                </label>

                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#31859c]"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-600">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#31859c]"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-600">
                  Message
                </label>

                <textarea
                  rows="6"
                  placeholder="Write your message..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 resize-none outline-none focus:border-[#31859c]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#31859c] hover:bg-[#286f82] text-white py-4 rounded-xl font-semibold flex justify-center items-center gap-2 transition shadow-lg shadow-[#31859c]/30"
              >
                <Send size={18} />
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
