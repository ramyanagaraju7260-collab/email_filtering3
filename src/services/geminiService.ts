export interface ClassificationResult {
  label: "Spam" | "Not Spam";
  reason: string;
}

export async function classifyEmail(emailContent: string): Promise<ClassificationResult> {
  if (!emailContent.trim()) {
    throw new Error("Email content cannot be empty.");
  }

  try {
    const response = await fetch("/api/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailContent }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to classify email.");
    }

    return await response.json();
  } catch (error) {
    console.error("Classification error:", error);
    throw error instanceof Error ? error : new Error("Failed to classify email. Please try again later.");
  }
}
