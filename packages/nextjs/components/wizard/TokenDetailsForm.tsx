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
      <div className="form-control w-full group/input">
        <label className="label">
          <span className="label-text font-medium text-base-content/60 group-focus-within/input:text-primary transition-colors font-display uppercase text-xs tracking-wide">
            Name
          </span>
        </label>
        <input
          type="text"
          placeholder="Fhenix USD"
          className="input input-bordered w-full bg-base-200 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-sm transition-all text-base-content placeholder:text-base-content/30 font-mono text-sm"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <div className="form-control w-1/2 group/input">
          <label className="label">
            <span className="label-text font-medium text-base-content/60 group-focus-within/input:text-primary transition-colors font-display uppercase text-xs tracking-wide">
              Ticker
            </span>
          </label>
          <input
            type="text"
            placeholder="FUSD"
            className="input input-bordered w-full bg-base-200 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-sm transition-all text-base-content placeholder:text-base-content/30 uppercase font-mono text-sm"
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
          />
        </div>

        <div className="form-control w-1/2 group/input">
          <label className="label">
            <span className="label-text font-medium text-base-content/60 group-focus-within/input:text-primary transition-colors font-display uppercase text-xs tracking-wide">
              Decimals
            </span>
          </label>
          <input
            type="number"
            placeholder="06"
            className="input input-bordered w-full bg-base-200 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-sm transition-all text-base-content placeholder:text-base-content/30 no-spinners font-mono text-sm"
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
