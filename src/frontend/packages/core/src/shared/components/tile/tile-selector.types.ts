export interface ITileIconConfig {
  matIcon: string;
  matIconFont?: string;
}

export interface ITileImgConfig {
  location: string;
}

export type ITileGraphic = ITileIconConfig | ITileImgConfig;

export class ITileConfig<T extends ITileData = ITileData> {
  constructor(
    readonly key: number,
    public label: string | number,
    public graphic: ITileGraphic,
    public data?: T,
  ) { }
}

export interface ITileData {
  [key: string]: string | number;
}
