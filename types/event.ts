import { Id } from "../convex/_generated/dataModel";

export interface Event {
  _id: Id<"events">;
  _creationTime: number;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published" | "ongoing" | "completed";
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  registrationFee?: number;
  organizerId: Id<"users">;
  judges?: Id<"users">[] | {
    id: Id<"users">;
    name: string;
    profile: any;
  }[];
  paymentLink?: string;
  organizer?: {
    name: string;
    email?: string;
    profile?: any;
  };
}