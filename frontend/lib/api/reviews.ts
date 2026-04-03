const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export const createReviewApi = async (bookingId: string, data: any) => {
  const res = await fetch(`${base_url}reviews/booking/${bookingId}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    console.log("Create Review  Error ", json);
    throw new Error(json.message || "Something went wrong");
  }
  return json.data;
};

export const getGuideReviewsApi = async (guideId: string) => {
  const res = await fetch(`${base_url}reviews/guide/${guideId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    console.log("Get Guide Review  Error  ", json);
    throw new Error(json.message || "Something went wrong");
  }
  return json.data;
};

// export const getMyReviewsApi = async () => {
//   const res = await fetch(`${base_url}/reviews/my-reviews`, {
//     headers: {
//       Authorization: `Bearer ${getToken()}`,
//     },
//   });

//   const json = await res.json();

//   if (!res.ok) {
//     console.log("Get My Reviews Error", json);
//     throw new Error(json.message || "Something went wrong");
//   }

//   return json.data;
// };

export const getBookingReviewApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}reviews/booking/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    console.log("Get Booking Review  Error ", json);
    throw new Error(json.message || "Something went wrong");
  }
  return json.data;
};

export const updateReviewApi = async (reviewId: string, data: any) => {
  const res = await fetch(`${base_url}reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    console.log("Get Booking Review  Error ", json);
    throw new Error(json.message || "Something went wrong");
  }
  return json.data;
};

export const deleteReviewApi = async (reviewId: string) => {
  const res = await fetch(`${base_url}reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    console.log("Get Booking Review  Error ", json);
    throw new Error(json.message || "Something went wrong");
  }
  return json.data;
};
