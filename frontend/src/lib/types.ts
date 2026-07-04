export type UserRole = "admin" | "student";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type VideoType = "youtube" | "vk" | "none";

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  content: string | null;
  video_url: string | null;
  video_type: VideoType;
  order: number;
  duration_minutes: number;
  created_at: string;
  completed?: boolean | null;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  order: number;
  created_at: string;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  image_url: string | null;
  is_published: boolean;
  instructor_id: number;
  created_at: string;
  updated_at: string;
  modules?: Module[];
  lessons_count?: number;
  is_enrolled?: boolean | null;
  progress_percent?: number | null;
}

export interface CourseListItem {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  price: number;
  image_url: string | null;
  is_published: boolean;
  lessons_count: number;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  progress_percent: number;
  enrolled_at: string;
  course_title: string;
  course_slug: string;
  course_image_url: string | null;
  lessons_count: number;
  completed_lessons: number;
}

export interface Payment {
  id: number;
  user_id: number;
  course_id: number;
  amount: number;
  discount_amount?: number;
  promo_code?: string | null;
  status: string;
  payment_method: string;
  external_id: string | null;
  payment_url?: string | null;
  created_at: string;
}

export interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  certificate_code: string;
  issued_at: string;
  course_title?: string | null;
  user_name?: string | null;
}

export interface Comment {
  id: number;
  user_id: number;
  lesson_id: number;
  content: string;
  created_at: string;
  user_name?: string | null;
  user_role?: string | null;
}

export interface PromoCode {
  id: number;
  code: string;
  discount_percent: number;
  discount_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Review {
  id: number;
  author_name: string;
  author_role: string | null;
  rating: number;
  text: string;
  avatar_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  is_published: boolean;
  created_at: string;
}

export interface PromoValidateResponse {
  code: string;
  original_price: number;
  discount: number;
  final_price: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
}
