import React, { useState } from 'react';
import { Dialog } from '@/src/components/ui/Dialog';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';

interface NewFontDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { family: string; style: string; weight: number; width: string }) => void;
}

export const NewFontDialog: React.FC<NewFontDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [family, setFamily] = useState('Untitled');
  const [style, setStyle] = useState('Regular');
  const [weight, setWeight] = useState('400');
  const [width, setWidth] = useState('Normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      family: family.trim() || 'Untitled Font',
      style,
      weight: parseInt(weight, 10) || 400,
      width,
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="New Font"
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} type="submit">
            Create
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Family"
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          placeholder="Untitled"
          autoFocus
        />

        <Select
          label="Style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          options={[
            { value: 'Regular', label: 'Regular' },
            { value: 'Italic', label: 'Italic' },
            { value: 'Bold', label: 'Bold' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Light', label: 'Light' },
          ]}
        />

        <Select
          label="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          options={[
            { value: '300', label: '300 (Light)' },
            { value: '400', label: '400 (Regular)' },
            { value: '500', label: '500 (Medium)' },
            { value: '600', label: '600 (SemiBold)' },
            { value: '700', label: '700 (Bold)' },
          ]}
        />

        <Select
          label="Width"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          options={[
            { value: 'Ultra Condensed', label: 'Ultra Condensed' },
            { value: 'Condensed', label: 'Condensed' },
            { value: 'Normal', label: 'Normal' },
            { value: 'Expanded', label: 'Expanded' },
          ]}
        />
      </form>
    </Dialog>
  );
};
