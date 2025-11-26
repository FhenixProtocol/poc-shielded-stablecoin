"use client";

interface TokenDetailsFormProps {
  name: string;
  symbol: string;
  decimals: number;
  onNameChange: (name: string) => void;
  onSymbolChange: (symbol: string) => void;
  onDecimalsChange: (decimals: number) => void;
}

export const TokenDetailsForm = ({
  name,
  symbol,
  decimals,
  onNameChange,
  onSymbolChange,
  onDecimalsChange,
}: TokenDetailsFormProps) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-fhenix-border"></span>
        <h3 className="text-[10px] font-pixel text-fhenix-muted uppercase tracking-widest">
          Token Params
        </h3>
        <span className="h-px flex-1 bg-fhenix-border"></span>
      </div>

      <div className="form-control w-full group/input">
        <label className="label">
          <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
            Name
          </span>
        </label>
        <input
          type="text"
          placeholder="Fhenix USD"
          className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 font-mono text-sm"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <div className="form-control w-1/2 group/input">
          <label className="label">
            <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
              Ticker
            </span>
          </label>
          <input
            type="text"
            placeholder="FUSD"
            className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 uppercase font-mono text-sm"
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
          />
        </div>

        <div className="form-control w-1/2 group/input">
          <label className="label">
            <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
              Decimals
            </span>
          </label>
          <input
            type="number"
            placeholder="18"
            className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 no-spinners font-mono text-sm"
            value={decimals}
            onChange={(e) => onDecimalsChange(Number(e.target.value))}
            min={0}
            max={255}
          />
        </div>
      </div>
    </div>
  );
};

