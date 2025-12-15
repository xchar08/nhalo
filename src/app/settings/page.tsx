// src/app/settings/page.tsx
import ApiKeyManager from '@/components/settings/ApiKeyManager';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-black p-12 flex justify-center">
      <ApiKeyManager />
    </main>
  );
}
