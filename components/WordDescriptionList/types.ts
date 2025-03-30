export interface WordDescription {
  word: string;
  desc: string;
}

export interface WordDescriptionListProps {
  words: WordDescription[];
  accentColor?: "blue" | "yellow" | "red";
  textColor?: "black" | "white";
}
