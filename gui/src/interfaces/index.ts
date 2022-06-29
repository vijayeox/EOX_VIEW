import EventListeners from "./events.interfaces";
interface CoreBase {
  /**
   * Logger module
   */
  readonly logger: any;
  /**
   * Configuration Tree
   */
  readonly configuration: any;
  /**
   * Options
   */
  readonly options: any;
  /**
   * Boot has been initiated
   */
  booted: boolean;
  /**
   * Fully started
   */
  started: boolean;
  /**
   * Fully destroyped
   */
  destroyd: boolean;
  /**
   * Service Provider Handler
   */
  providers: any;
  /**
   * Constructor
   */
  constructor(name?: string);
  /**
   * Destroy core instance
   */
  destroy(): void;
  /**
   * Boots up OS.js
   */
  boot(): Promise<boolean>;
  /**
   * Starts all core services
   */
  start(): Promise<boolean>;
  /**
   * Gets a configuration entry by key
   */
  config(key: string, defaultValue: any): any;
  /**
   * Register a instanciator provider
   */
  instance(name: string, callback: Function): void;
  /**
   * Register a singleton provider
   */
  singleton(name: string, callback: Function): void;
  /**
   * Create an instance of a provided service
   */
  make<T>(name: string, ...args: any[]): T;
  /**
   * Check if a service exists
   */
  has(name: string): boolean;
}
interface Pageable {
  skip?: number;
  buttonCount?: number;
  info?: boolean;
  pageSizes?: number[];
}
export { EventListeners, CoreBase, Pageable };
