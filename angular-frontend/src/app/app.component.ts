import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestrictDirective } from './restrict.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RestrictDirective],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user: any = null;
  email = 'student@demo.com';
  password = '123456';
  loginError = '';

  activeSubject: any = null;
  isSearchOpen = false;
  query = '';
  searchTimer: any;
  searchResults: any = { subjects: [], folders: [], files: [] };
  isSearching = false;

  subjects: any[] = [];
  overview: any = null;
  folders: any[] = [];
  activeFolder: any = null;
  files: any[] = [];
  subjectFiles: any[] = [];
  _viewFile: any = null;
  deleting: any = null;
  showLogoutConfirm = false;
  editorContent = '';

  get viewFile() { return this._viewFile; }
  set viewFile(val: any) {
    this._viewFile = val;
    this.editorContent = val ? val.content : '';
  }

  async paste() {
    try {
      const text = await navigator.clipboard.readText();
      this.editorContent += text;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Paste failed', err);
    }
  }

  fileSaved = false;

  saveFile() {
    if (!this.viewFile) return;
    this.http.put(`http://localhost:5000/api/files/${this.viewFile.id}/content`, { content: this.editorContent }).subscribe(() => {
      this.viewFile.content = this.editorContent;
      this.files = this.files.map(f => f.id === this.viewFile.id ? { ...f, content: this.editorContent } : f);
      this.subjectFiles = this.subjectFiles.map(f => f.id === this.viewFile.id ? { ...f, content: this.editorContent } : f);
      this.fileSaved = true;
      this.cdr.detectChanges();
      setTimeout(() => { this.fileSaved = false; this.cdr.detectChanges(); }, 2000);
    });
  }

  askLogout() {
    this.showLogoutConfirm = true;
  }

  create(type: string) {
    if (!this.createName.trim()) {
      this.errorMsg = 'Name cannot be empty';
      return;
    }
    this.errorMsg = '';

    if (type === 'folder') {
      const parentId = this.activeFolder ? this.activeFolder.id : this.activeSubject.id;
      this.http.post('http://localhost:5000/api/folders', { name: this.createName, parentId, userId: this.user?.id }).subscribe((newFolder: any) => {
        if (this.activeFolder) {
          this.subFolders = [...this.subFolders, newFolder];
        } else {
          this.folders = [...this.folders, newFolder];
        }
        this.cdr.detectChanges();
      });
    } else if (type === 'file') {
      this.http.post('http://localhost:5000/api/files', { name: this.createName, folderId: this.activeFolder.id, userId: this.user?.id }).subscribe((newFile: any) => {
        this.files = [...this.files, newFile];
        this.subjectFiles = [...this.subjectFiles, newFile];
        this.cdr.detectChanges();
      });
    }

    this.creating = false;
    this.createName = '';
  }

  copied: string | null = null;
  filterMode: string = 'all';
  
  creating = false;
  createName = '';
  errorMsg = '';
  subFolders: any[] = [];
  confirmingDelete = false;
  depth = 0;

  get codeLines(): string[] {
    return this.viewFile ? this.viewFile.content.split('\n') : [];
  }

  get favoriteFiles() {
    return this.subjectFiles.filter(f => f.isFavorite);
  }

  get importantFiles() {
    return this.subjectFiles.filter(f => f.isImportant);
  }

  deleteFromViewer() {
    if (!this.viewFile) return;
    const id = this.viewFile.id;
    this.http.delete(`http://localhost:5000/api/files/${id}`).subscribe(() => {
      this.confirmingDelete = false;
      this.viewFile = null;
      if (this.activeFolder) {
        this.http.get<any[]>(`http://localhost:5000/api/files/${this.activeFolder.id}?userId=${this.user?.id || ''}`).subscribe(d => this.files = d);
      }
      if (this.activeSubject) {
        this.http.get<any[]>(`http://localhost:5000/api/subject-files/${this.activeSubject.id}?userId=${this.user?.id || ''}`).subscribe(d => this.subjectFiles = d);
      }
    });
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/overview').subscribe((data: any) => this.overview = data);
  }

  loadSubjects() {
    if (this.user?.id) {
      this.http.get<any[]>(`http://localhost:5000/api/subjects?userId=${this.user.id}`).subscribe((data: any[]) => { this.subjects = data; this.cdr.detectChanges(); });
    }
  }

  login(e: Event) {
    e.preventDefault();
    this.http.post<any>('http://localhost:5000/api/login', { email: this.email, password: this.password })
      .subscribe({
        next: (data: any) => {
          if (data.success) {
            this.user = data.user;
            this.loadSubjects();
          } else {
            this.loginError = data.message;
          }
        },
        error: () => this.loginError = 'Server connection failed.'
      });
  }

  logout() {
    this.user = null;
    this.activeSubject = null;
    this.activeFolder = null;
  }

  selectSubject(sub: any) {
    this.activeSubject = sub;
    this.activeFolder = null;
    this.filterMode = 'all';
    this.subFolders = [];
    this.folders = [];
    this.subjectFiles = [];
    if (sub) {
      this.http.get<any[]>(`http://localhost:5000/api/folders/${sub.id}?userId=${this.user?.id || ''}`).subscribe((data: any[]) => { this.folders = data; this.cdr.detectChanges(); });
      this.http.get<any[]>(`http://localhost:5000/api/subject-files/${sub.id}?userId=${this.user?.id || ''}`).subscribe((data: any[]) => { this.subjectFiles = data; this.cdr.detectChanges(); });
    }
  }

  selectFolder(folder: any) {
    this.activeFolder = folder;
    this.creating = false;
    if (folder) {
      this.http.get<any[]>(`http://localhost:5000/api/files/${folder.id}?userId=${this.user?.id || ''}`).subscribe((data: any[]) => { this.files = data; this.cdr.detectChanges(); });
      this.http.get<any[]>(`http://localhost:5000/api/folders/${folder.id}?userId=${this.user?.id || ''}`).subscribe((data: any[]) => { this.subFolders = data; this.cdr.detectChanges(); });
      if (this.activeSubject?.name === 'FST') {
        this.http.get<any>(`http://localhost:5000/api/folder-depth/${folder.id}`).subscribe((data: any) => { this.depth = data.depth; this.cdr.detectChanges(); });
      } else {
        this.depth = 0;
      }
    } else {
      this.depth = 0;
    }
  }

  goBack() {
    if (this.activeFolder) {
      this.activeFolder = null;
      this.subFolders = [];
    } else {
      this.activeSubject = null;
    }
  }

  toggle(id: string, param: string, event: Event) {
    event.stopPropagation();
    const prop = param === 'favorite' ? 'isFavorite' : 'isImportant';
    
    this.files = this.files.map(file => 
      file.id === id ? { ...file, [prop]: !file[prop] } : file
    );
    
    this.subjectFiles = this.subjectFiles.map(file => 
      file.id === id ? { ...file, [prop]: !file[prop] } : file
    );

    if (this.viewFile && this.viewFile.id === id) {
      this.viewFile = { ...this.viewFile, [prop]: !this.viewFile[prop] };
    }

    this.http.patch(`http://localhost:5000/api/files/${id}/${param}`, {}).subscribe();
    this.cdr.detectChanges();
  }

  promptDelete(type: string, item: any, event: Event) {
    event.stopPropagation();
    this.deleting = { type, id: item.id, name: item.name };
  }

  doDelete() {
    if (!this.deleting) return;
    const { type, id } = this.deleting;
    this.http.delete(`http://localhost:5000/api/${type}s/${id}`).subscribe(() => {
      this.deleting = null;
      if (type === 'folder') {
        this.http.get<any[]>(`http://localhost:5000/api/folders/${this.activeSubject.id}?userId=${this.user?.id || ''}`).subscribe((data: any[]) => this.folders = data);
      } else {
        if (this.activeFolder) this.http.get<any[]>(`http://localhost:5000/api/files/${this.activeFolder.id}?userId=${this.user?.id || ''}`).subscribe((data: any[]) => this.files = data);
        if (this.activeSubject && !this.activeFolder) this.http.get<any[]>(`http://localhost:5000/api/subject-files/${this.activeSubject.id}?userId=${this.user?.id || ''}`).subscribe((data: any[]) => this.subjectFiles = data);
      }
    });
  }

  search(event: any) {
    this.query = event.target.value;
    if (!this.query.trim()) {
      this.searchResults = { subjects: [], folders: [], files: [] };
      return;
    }
    this.isSearching = true;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.http.get<any>(`http://localhost:5000/api/search?q=${encodeURIComponent(this.query)}&userId=${this.user?.id || ''}`)
        .subscribe((data: any) => {
          this.searchResults = data;
          this.isSearching = false;
        });
    }, 300);
  }
}
