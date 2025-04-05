// File: app/training-hub/[id]/page.tsx
import ModuleDetails from '@/components/ModuleDetails'

// Define your module data at the server level
const moduleData = {
  1: {
    title: "Classroom Management",
    description: "Learn effective strategies for managing your classroom",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    quizzes: [
      {
        question: "What is the most effective way to handle disruptive behavior?",
        options: [
          "Ignore it",
          "Immediately send the student out",
          "Address it calmly and privately",
          "Punish the entire class",
        ],
        correctAnswer: 2,
      },
    ],
  },
}

// This function tells Next.js which dynamic routes to pre-render
export async function generateStaticParams() {
  // Return an array of objects with the id property
  return Object.keys(moduleData).map((id) => ({
    id: id.toString(),
  }))
}

// Server component for the page
export default function ModuleDetailsPage({ params }: { params: { id: string } }) {
  const moduleId = params.id
  const module = moduleData[moduleId as keyof typeof moduleData]
  
  // Pass the module data to the client component
  return <ModuleDetails module={module} />
}
