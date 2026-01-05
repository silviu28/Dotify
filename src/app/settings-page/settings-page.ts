import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { EqualizerBand, EqualizerSettings } from '../../types';
import { UserPreferencesService } from '../user-preferences-service';

interface EqualizerPreset {
  name: string;
  description: string;
  bands: Record<string, number>;
  preamp: number;
  isCustom?: boolean;
}

interface ListeningModeCard {
  title: string;
  subtitle: string;
  accent: string;
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css'
})
export class SettingsPage {
  private userPrefs = inject(UserPreferencesService);
  equalizer = this.userPrefs.equalizerSettings;

  readonly presets: EqualizerPreset[] = [
    {
      name: 'Custom',
      description: 'Fine-tune every band manually.',
      bands: {},
      preamp: 0,
      isCustom: true,
    },
    {
      name: 'Balanced',
      description: 'Keeps everything neutral for everyday listening.',
      bands: {
        '60 Hz': 0,
        '170 Hz': 0,
        '310 Hz': 0,
        '600 Hz': 0,
        '1 kHz': 0,
        '3 kHz': 0,
        '6 kHz': 0,
        '12 kHz': 0,
      },
      preamp: 0,
    },
    {
      name: 'Bass Boost',
      description: 'Adds warmth and weight to low-end heavy tracks.',
      bands: {
        '60 Hz': 6,
        '170 Hz': 4,
        '310 Hz': 2,
        '600 Hz': 1,
        '1 kHz': 0,
        '3 kHz': -1,
        '6 kHz': -2,
        '12 kHz': -3,
      },
      preamp: -1,
    },
    {
      name: 'Vocal Boost',
      description: 'Brings speech and lead vocals forward in the mix.',
      bands: {
        '60 Hz': -2,
        '170 Hz': -1,
        '310 Hz': 0,
        '600 Hz': 2,
        '1 kHz': 4,
        '3 kHz': 5,
        '6 kHz': 3,
        '12 kHz': 1,
      },
      preamp: -2,
    },
    {
      name: 'Treble Lift',
      description: 'Adds sparkle for acoustic and live recordings.',
      bands: {
        '60 Hz': -3,
        '170 Hz': -2,
        '310 Hz': -1,
        '600 Hz': 0,
        '1 kHz': 2,
        '3 kHz': 3,
        '6 kHz': 4,
        '12 kHz': 5,
      },
      preamp: -2,
    },
  ];

  readonly listeningModes: ListeningModeCard[] = [
    {
      title: 'Studio Monitor',
      subtitle: 'Keeps playback flat while still honoring your preset.',
      accent: 'neutral',
    },
    {
      title: 'Night Drive',
      subtitle: 'Softens highs and keeps bass focused at lower volumes.',
      accent: 'nocturnal',
    },
    {
      title: 'Cinematic',
      subtitle: 'Expands stereo width for movies and live albums.',
      accent: 'wide',
    },
  ];

  readonly minBand = -12;
  readonly maxBand = 12;
  readonly minPreamp = -6;
  readonly maxPreamp = 6;

  activePresetDescription = computed(() => {
    const presetName = this.equalizer().preset;
    return this.presets.find(preset => preset.name === presetName)?.description ?? 'Manual adjustments in progress.';
  });

  previewPolyline = computed(() => this.buildPreviewPoints(this.equalizer().bands));

  toggleEnabled(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateEqualizer(settings => {
      settings.enabled = checked;
      return settings;
    });
  }

  changePreset(event: Event) {
    const selected = (event.target as HTMLSelectElement).value;
    const preset = this.presets.find(p => p.name === selected);
    if (!preset) {
      return;
    }

    if (preset.isCustom) {
      this.updateEqualizer(settings => {
        settings.preset = preset.name;
        return settings;
      });
      return;
    }

    this.updateEqualizer(settings => {
      settings.preset = preset.name;
      settings.preamp = preset.preamp;
      settings.enabled = true;
      settings.bands = settings.bands.map(band => ({
        ... band,
        value: preset.bands[band.label] ?? band.value,
      }));
      return settings;
    });
  }

  updatePreamp(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.updateEqualizer(settings => {
      settings.preamp = value;
      if (settings.preset !== 'Custom') {
        settings.preset = 'Custom';
      }
      return settings;
    });
  }

  updateBandValue(label: string, event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.updateEqualizer(settings => {
      settings.bands = settings.bands.map(band =>
        band.label === label ? { ... band, value } : band
      );
      settings.preset = 'Custom';
      return settings;
    });
  }

  resetEqualizer() {
    this.userPrefs.resetEqualizerSettings();
  }

  formatValue(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }

  private updateEqualizer(mutator: (current: EqualizerSettings) => EqualizerSettings) {
    const current = this.cloneEqualizer(this.equalizer());
    this.userPrefs.setEqualizerSettings(mutator(current));
  }

  private cloneEqualizer(settings: EqualizerSettings): EqualizerSettings {
    return {
      ... settings,
      bands: settings.bands.map(band => ({ ... band }))
    };
  }

  private buildPreviewPoints(bands: EqualizerBand[]): string {
    if (!bands.length) {
      return '';
    }

    const maxIndex = bands.length - 1;
    return bands
      .map((band, index) => {
        const x = (index / maxIndex) * 100;
        const y = 50 - (band.value / this.maxBand) * 40;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }
}
