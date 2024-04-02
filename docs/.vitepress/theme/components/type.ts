export interface WebUrl {
  name: string;
  url: string;
  type?: "url" | "minapp" | "app";
}

export interface OpenSourceUrl {
  url: string;
  type?: "github";
}

export interface Project {
  name: string;
  desc: string;
  icon: any;
  showUrl: boolean;
  openSource: boolean;
  gitUrls?: Array<OpenSourceUrl>;
  time: string;
  url: Array<WebUrl>;
  tags: Array<string>;
  log: string;
}

export interface Projects {
  label: string;
  list: Array<Project>;
}
