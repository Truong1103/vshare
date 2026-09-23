export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  bio: string | null;
  area: string | null;
  skills: string[];
  availability: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  is_banned: boolean;
  time_credit: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type SkillPost = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string;
  area: string | null;
  mode: "online" | "offline" | "both";
  availability: string | null;
  status: "active" | "hidden" | "closed" | "deleted";
  created_at: string;
  profiles?: Profile;
  categories?: Category | null;
};

export type HelpRequest = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string;
  area: string | null;
  mode: "online" | "offline" | "both";
  duration_hours: number;
  time_credit: number;
  desired_time: string | null;
  status: "open" | "matched" | "completed" | "cancelled" | "hidden";
  created_at: string;
  profiles?: Profile;
  categories?: Category | null;
};

export type Transaction = {
  id: string;
  request_id: string | null;
  skill_id: string | null;
  requester_id: string;
  helper_id: string;
  conversation_id: string | null;
  hours: number;
  amount: number;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  requester_confirmed_at: string | null;
  helper_confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  requester?: Profile;
  helper?: Profile;
  help_requests?: HelpRequest | null;
  skill_posts?: SkillPost | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
};

export type Ledger = {
  id: string;
  user_id: string;
  amount: number;
  type: "earn" | "spend" | "bonus" | "adjustment";
  transaction_id: string | null;
  note: string | null;
  created_at: string;
};
