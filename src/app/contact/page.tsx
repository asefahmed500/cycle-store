export default function Contact() {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
  
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </section>
  
            <section>
              <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:contact@bicyclestore.com" className="text-primary hover:underline">
                    contact@bicyclestore.com
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:1-800-BICYCLE" className="text-primary hover:underline">
                    1-800-BICYCLE
                  </a>
                </p>
                <p>
                  <strong>Address:</strong>
                  <br />
                  123 Bike Street
                  <br />
                  Cycling City, CC 12345
                  <br />
                  United States
                </p>
              </div>
            </section>
  
            <section>
              <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
              <div className="space-y-1">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </section>
          </div>
  
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }
  
  