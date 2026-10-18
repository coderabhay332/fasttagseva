import React, { useRef, useState } from 'react';
import { Check, UploadCloud, Camera, X } from 'lucide-react';

interface FileDropProps {
	label: string;
	hint?: string;
	/** Existing uploaded image URL (from the server), if any. */
	uploadedUrl?: string;
	/** Currently selected (not-yet-uploaded) file. */
	file?: File | null;
	loading?: boolean;
	disabled?: boolean;
	onSelect: (file: File) => void;
	onClear?: () => void;
}

/**
 * Brandy drag-and-drop file picker with image preview and a mobile
 * "take photo" option (capture="environment"). Shows a success state
 * once a URL is present.
 */
export default function FileDrop({
	label,
	hint,
	uploadedUrl,
	file,
	loading = false,
	disabled = false,
	onSelect,
	onClear,
}: FileDropProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const cameraRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);

	// Local object URL for previewing a freshly selected (un-uploaded) file.
	const localPreview = file ? URL.createObjectURL(file) : undefined;
	const previewUrl = uploadedUrl || localPreview;

	const handleFiles = (files: FileList | null) => {
		if (disabled) return;
		const f = files?.[0];
		if (f) onSelect(f);
	};

	return (
		<div
			className={[
				'rounded-2xl border-2 border-dashed p-4 transition-colors',
				dragOver ? 'border-yellow-500 bg-yellow-50' : 'border-slate-300 bg-white',
				disabled ? 'opacity-60' : '',
			].join(' ')}
			onDragOver={(e) => {
				e.preventDefault();
				if (!disabled) setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setDragOver(false);
				handleFiles(e.dataTransfer.files);
			}}
		>
			<div className="mb-2 flex items-center justify-between">
				<span className="font-display text-sm font-extrabold text-slate-900">{label}</span>
				{uploadedUrl && (
					<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
						<Check className="h-3.5 w-3.5" strokeWidth={3} /> Uploaded
					</span>
				)}
			</div>

			{previewUrl ? (
				<div className="flex items-center gap-3">
					<img
						src={previewUrl}
						alt={label}
						className="h-20 w-28 rounded-lg border-2 border-slate-900 object-cover"
					/>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm text-slate-600">
							{file?.name || 'Current document'}
						</p>
						{!uploadedUrl && !disabled && (
							<div className="mt-2 flex gap-2">
								<button
									type="button"
									onClick={() => inputRef.current?.click()}
									className="text-xs font-bold text-blue-600 hover:underline"
								>
									Replace
								</button>
								{onClear && (
									<button
										type="button"
										onClick={onClear}
										className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:underline"
									>
										<X className="h-3 w-3" /> Remove
									</button>
								)}
							</div>
						)}
						{loading && <p className="mt-1 text-xs font-semibold text-slate-500">Uploading…</p>}
					</div>
				</div>
			) : (
				<button
					type="button"
					disabled={disabled}
					onClick={() => inputRef.current?.click()}
					className="flex w-full flex-col items-center justify-center gap-1 py-4 text-slate-500 disabled:cursor-not-allowed"
				>
					<UploadCloud className="h-7 w-7" />
					<span className="text-sm font-semibold">Drag &amp; drop or tap to choose</span>
					{hint && <span className="text-xs text-slate-400">{hint}</span>}
				</button>
			)}

			{/* Mobile camera shortcut */}
			{!uploadedUrl && !disabled && (
				<div className="mt-2 flex justify-center sm:hidden">
					<button
						type="button"
						onClick={() => cameraRef.current?.click()}
						className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-900 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
					>
						<Camera className="h-4 w-4" /> Take a photo
					</button>
				</div>
			)}

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(e) => handleFiles(e.target.files)}
			/>
			<input
				ref={cameraRef}
				type="file"
				accept="image/*"
				capture="environment"
				className="hidden"
				onChange={(e) => handleFiles(e.target.files)}
			/>
		</div>
	);
}
