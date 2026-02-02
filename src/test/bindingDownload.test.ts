import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPlatformIdentifier } from '../client/utils';

// Create hoisted mock function
const { mockFamily } = vi.hoisted(() => ({
    mockFamily: vi.fn().mockImplementation(() => Promise.resolve(null))
}));

// Mock the module using the hoisted mock
vi.mock('detect-libc', () => ({
    family: mockFamily,
    MUSL: 'musl'
}));

describe('getPlatformIdentifier', () => {
    beforeEach(async () => {
        vi.resetModules();
        vi.restoreAllMocks();
        mockFamily.mockResolvedValue(null);
        // Default spies to standard linux/x64
        vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
        vi.spyOn(process, 'arch', 'get').mockReturnValue('x64');
        vi.spyOn(process, 'versions', 'get').mockReturnValue({ ...process.versions, musl: undefined } as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Linux scenarios', () => {
        it('should detect MUSL when detect-libc returns MUSL', async () => {
            mockFamily.mockResolvedValue('musl');

            const result = await getPlatformIdentifier();
            expect(result).toBe('linux-x64-musl');
        });

        it('should fallback to legacy detection if detect-libc fails', async () => {
            vi.spyOn(process, 'versions', 'get').mockReturnValue({ ...process.versions, musl: '1.2.3' } as any);
            mockFamily.mockRejectedValue(new Error('detect-libc failed'));

            const result = await getPlatformIdentifier();
            expect(result).toBe('linux-x64-musl');
        });

        it('should fallback to GNU when detect-libc fails and not MUSL', async () => {
            vi.spyOn(process, 'versions', 'get').mockReturnValue({ ...process.versions, musl: undefined } as any);
            mockFamily.mockRejectedValue(new Error('detect-libc failed'));

            const result = await getPlatformIdentifier();
            expect(result).toBe('linux-x64-gnu');
        });

        it('should handle ARM architecture in fallback mode', async () => {
            vi.spyOn(process, 'arch', 'get').mockReturnValue('arm');
            vi.spyOn(process, 'versions', 'get').mockReturnValue({ ...process.versions, musl: undefined } as any);
            mockFamily.mockRejectedValue(new Error('detect-libc failed'));

            const result = await getPlatformIdentifier();
            expect(result).toBe('linux-arm-gnueabihf');
        });
    });

    describe('Other OS scenarios', () => {
        it('should detect Windows', async () => {
            vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
            const result = await getPlatformIdentifier();
            expect(result).toBe('win32-x64-msvc');
        });
    });
});