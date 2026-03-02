import ExperienceSection from '@/components/ExperienceSection';
import { getExperienceFromResume } from '@/lib/actions';

export default async function ExperienceSectionServer() {
  const experiencesFromResume = await getExperienceFromResume().catch(() => []);
  return <ExperienceSection experiences={experiencesFromResume} />;
}
