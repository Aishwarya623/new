import { useState } from "react";

const Contact = () => {
    const [formData, setFormData] = useState({ name: "", email: "", message: "", company: "" });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("http://localhost:5000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const contentType = response.headers.get("content-type");

            if (!response.ok) {
                let errorMessage = "Failed to send message. Please try again.";
                if (contentType && contentType.includes("application/json")) {
                    try {
                        const data = await response.json();
                        errorMessage = data.error || errorMessage;
                    } catch (jsonError) {
                        console.error("Error parsing JSON (error):", jsonError);
                        errorMessage = "Error parsing server response (error).";
                    }
                } else {
                    try {
                        const text = await response.text();
                        errorMessage = text || errorMessage;
                    } catch (textError) {
                        console.error("Error getting text (error):", textError);
                        errorMessage = "Error getting server response text (error).";
                    }
                }
                setError(errorMessage); // Set error message
                return; // Exit function
            }

            if (contentType && contentType.includes("application/json")) {
                try {
                    const data = await response.json();
                    if (data.success) {
                        setSuccess(true);
                        setError(null); // Clear any previous errors
                    } else {
                        setError(data.error || "An unknown error occurred.");
                        setSuccess(false);
                    }
                } catch (jsonError) {
                    console.error("Error parsing JSON (success):", jsonError);
                    setError("Error parsing server response (success).");
                    setSuccess(false);
                }
            } else {
                setSuccess(true); // If not JSON, assume success (or adjust as needed)
                setError(null);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "Failed to send message. Please try again.");
            } else {
                setError("An unknown error occurred.");
            }
            setSuccess(false);
        }
    };

    return (
        <div>
            <h1>Contact Us</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>Message sent successfully!</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="text" name="company" placeholder="Company (Optional)" onChange={handleChange} />
                <textarea name="message" placeholder="Message" onChange={handleChange} required />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Contact;