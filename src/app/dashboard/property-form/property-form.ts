import { Component, OnInit } from '@angular/core';
import { PropertyService, Property } from '../property.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-property-form',
  imports: [ CommonModule, FormsModule, MatIconModule ],
  templateUrl: './property-form.html',
  styleUrl: './property-form.css',
})
export class PropertyForm implements OnInit {
  isEdit = false;
  id?: number;
  model: Property = {
    title: '',
    location: '',
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    size: 0,
    description: '',
    images: [],
    status: 'draft'
  };

  // local images preview
  imageFiles: File[] = [];
  imagePreviews: (string | ArrayBuffer | null)[] = [];

  // map
  lat = 14.6928;
  lng = -17.4467;

  loading = false;

  constructor(
    private svc: PropertyService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    if(param) {
      this.isEdit = true;
      this.id = Number(param);
      this.svc.get(this.id!).subscribe(p => {
        this.model = p;
        // for edit: show current images as previews (server urls)
        this.imagePreviews = p.images?.map(i=>i) || [];
      });
    }
  }

  onFilesSelected(evt: any) {
    const files: FileList = evt.target.files;
    for(let i=0;i<files.length;i++){
      const f = files.item(i)!;
      this.imageFiles.push(f);
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreviews.push((e.target as any).result);
      reader.readAsDataURL(f);
    }
  }

  removePreview(index: number) {
    this.imagePreviews.splice(index,1);
    this.imageFiles.splice(index,1);
  }

  submit() {
    this.loading = true;
    const payload = { ...this.model };
    if(this.isEdit && this.id){
      this.svc.update(this.id, payload).subscribe(()=> {
        this.uploadImagesIfAny().then(()=> { this.loading=false; this.router.navigate(['/dashboard/properties']); });
      });
    } else {
      this.svc.create(payload).subscribe((res: any) => {
        this.id = res.id;
        this.uploadImagesIfAny().then(()=> { this.loading=false; this.router.navigate(['/dashboard/properties']); });
      });
    }
  }

  async uploadImagesIfAny() {
    if(!this.imageFiles.length || !this.id) return Promise.resolve();
    const fd = new FormData();
    this.imageFiles.forEach(f => fd.append('images[]', f));
    return this.svc.uploadImage(this.id!, fd).toPromise();
  }

  pickLocation(lat:number,lng:number){
    this.lat = lat; this.lng = lng;
    this.model.location = `${lat},${lng}`; // or reverse geocode
  }

}
