/**
 * Client Microsoft Graph pour récupérer les informations utilisateur
 */

import { Client } from '@microsoft/microsoft-graph-client';

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  userPrincipalName: string;
}

/**
 * Client Microsoft Graph
 */
export class GraphClient {
  private client: Client;

  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Récupère le profil de l'utilisateur courant
   */
  async getCurrentUser(): Promise<GraphUser> {
    const user = await this.client
      .api('/me')
      .select('id,displayName,mail,jobTitle,department,userPrincipalName')
      .get();

    return {
      id: user.id,
      displayName: user.displayName,
      mail: user.mail || user.userPrincipalName,
      jobTitle: user.jobTitle,
      department: user.department,
      userPrincipalName: user.userPrincipalName,
    };
  }

  /**
   * Récupère la photo de profil de l'utilisateur
   */
  async getUserPhoto(): Promise<Blob | null> {
    try {
      const photo = await this.client.api('/me/photo/$value').get();
      return photo;
    } catch (error) {
      console.warn('Could not fetch user photo:', error);
      return null;
    }
  }
}

/**
 * Crée une instance du client Graph
 */
export function createGraphClient(accessToken: string): GraphClient {
  return new GraphClient(accessToken);
}

