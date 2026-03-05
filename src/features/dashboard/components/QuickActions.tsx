'use client';

import { Plus, Download, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path as never);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="primary"
        leftIcon={<Plus size={18} strokeWidth={1.5} />}
        onClick={() => navigate('/receivables?action=new')}
      >
        חוב חדש
      </Button>
      <Button
        variant="secondary"
        leftIcon={<Download size={18} strokeWidth={1.5} />}
        onClick={() => navigate('/settings?tab=import')}
      >
        ייבוא
      </Button>
      <Button
        variant="whatsapp"
        leftIcon={<Send size={18} strokeWidth={1.5} />}
        onClick={() => navigate('/messages')}
      >
        תזכורת בכמות
      </Button>
    </div>
  );
}
